import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../configs/api.js';

// usage: dispatch(fetchWorkspaces({ getToken }))  or  { getToken, silent: true } for background polling
export const fetchWorkspaces = createAsyncThunk(
    'workspaces/fetchWorkspaces',
    async ({ getToken }, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/workspaces', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            return data.workspaces || [];
        } catch (error) {
            console.log(error?.response?.data?.message || error.message);
            // reject (instead of returning []) so a network error never wipes existing workspaces
            return rejectWithValue(error?.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: true, // true until the first fetch finishes, avoids flashing the create-org form
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload);
        },
        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);

            // set current workspace to the new workspace
            if (state.currentWorkspace?.id !== action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.id ? action.payload : w
            );

            // if current workspace is updated, set it to the updated workspace
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action) => {
            // payload = workspace id  (Prisma uses `id`, not `_id`)
            state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
            if (state.currentWorkspace?.id === action.payload) {
                state.currentWorkspace = state.workspaces[0] || null;
            }
        },
        addProject: (state, action) => {
            const newProject = action.payload;

            if (state.currentWorkspace) {
                const currentProjects = state.currentWorkspace.projects || [];
                state.currentWorkspace = {
                    ...state.currentWorkspace,
                    projects: [...currentProjects, newProject]
                };
            }

            // Find workspace by id and add project to it immutably
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace?.id
                    ? { ...w, projects: [...(w.projects || []), newProject] }
                    : w
            );
        },
        addTask: (state, action) => {
            const newTask = action.payload;

            if (state.currentWorkspace) {
                state.currentWorkspace = {
                    ...state.currentWorkspace,
                    projects: (state.currentWorkspace.projects || []).map((p) => {
                        if (p.id === newTask.projectId) {
                            return { ...p, tasks: [...(p.tasks || []), newTask] };
                        }
                        return p;
                    })
                };
            }

            // Find workspace and project by id and add task to it immutably
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace?.id
                    ? {
                        ...w,
                        projects: (w.projects || []).map((p) =>
                            p.id === newTask.projectId
                                ? { ...p, tasks: [...(p.tasks || []), newTask] }
                                : p
                        ),
                    }
                    : w
            );
        },
        updateTask: (state, action) => {
            const updatedTask = action.payload;

            if (state.currentWorkspace) {
                state.currentWorkspace = {
                    ...state.currentWorkspace,
                    projects: (state.currentWorkspace.projects || []).map((p) => {
                        if (p.id === updatedTask.projectId) {
                            return {
                                ...p,
                                tasks: (p.tasks || []).map((t) =>
                                    t.id === updatedTask.id ? updatedTask : t
                                )
                            };
                        }
                        return p;
                    })
                };
            }

            // Find workspace and project by id and update task in it immutably
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace?.id
                    ? {
                        ...w,
                        projects: (w.projects || []).map((p) =>
                            p.id === updatedTask.projectId
                                ? {
                                    ...p,
                                    tasks: (p.tasks || []).map((t) =>
                                        t.id === updatedTask.id ? updatedTask : t
                                    ),
                                }
                                : p
                        ),
                    }
                    : w
            );
        },
        deleteTask: (state, action) => {
            // payload = array of task ids
            const ids = action.payload;

            if (state.currentWorkspace) {
                state.currentWorkspace = {
                    ...state.currentWorkspace,
                    projects: (state.currentWorkspace.projects || []).map((p) => ({
                        ...p,
                        tasks: (p.tasks || []).filter((t) => !ids.includes(t.id)),
                    }))
                };
            }

            // Remove the tasks from the matching workspace too immutably
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace?.id
                    ? {
                        ...w,
                        projects: (w.projects || []).map((p) => ({
                            ...p,
                            tasks: (p.tasks || []).filter((t) => !ids.includes(t.id)),
                        })),
                    }
                    : w
            );
        },
    },

    extraReducers: (builder) => {
        builder.addCase(fetchWorkspaces.pending, (state, action) => {
            // silent polling should not show the full-page loader
            if (!action.meta.arg?.silent) {
                state.loading = true;
            }
        });
        builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
            state.workspaces = action.payload;

            if (action.payload.length > 0) {
                const savedId = localStorage.getItem('currentWorkspaceId');
                const saved = savedId ? action.payload.find((w) => w.id === savedId) : null;
                state.currentWorkspace = saved || action.payload[0];
            }
            state.loading = false;
        });
        builder.addCase(fetchWorkspaces.rejected, (state) => {
            state.loading = false;
        });
    },
});

export const {
    setWorkspaces,
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addProject,
    addTask,
    updateTask,
    deleteTask,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;