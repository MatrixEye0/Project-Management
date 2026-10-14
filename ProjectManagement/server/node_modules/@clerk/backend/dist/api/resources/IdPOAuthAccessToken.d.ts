import type { JwtPayload } from '@clerk/shared/types';
import type { IdPOAuthAccessTokenActorJSON, IdPOAuthAccessTokenJSON } from './JSON';
export declare class IdPOAuthAccessToken {
    readonly id: string;
    readonly clientId: string;
    readonly type: string;
    readonly subject: string;
    readonly scopes: string[];
    readonly revoked: boolean;
    readonly revocationReason: string | null;
    readonly expired: boolean;
    /** The Unix timestamp (in seconds) when the access token expires. */
    readonly expiration: number | null;
    /** The Unix timestamp (in seconds) when the access token was created. */
    readonly createdAt: number;
    /** The Unix timestamp (in seconds) when the access token was last updated. */
    readonly updatedAt: number;
    /** The intended audience for the access token. */
    readonly aud?: string[] | undefined;
    /** The actor chain of a token issued by an OAuth 2.0 Token Exchange (RFC 8693 section 4.1). */
    readonly act?: IdPOAuthAccessTokenActorJSON | undefined;
    constructor(id: string, clientId: string, type: string, subject: string, scopes: string[], revoked: boolean, revocationReason: string | null, expired: boolean, 
    /** The Unix timestamp (in seconds) when the access token expires. */
    expiration: number | null, 
    /** The Unix timestamp (in seconds) when the access token was created. */
    createdAt: number, 
    /** The Unix timestamp (in seconds) when the access token was last updated. */
    updatedAt: number, 
    /** The intended audience for the access token. */
    aud?: string[] | undefined, 
    /** The actor chain of a token issued by an OAuth 2.0 Token Exchange (RFC 8693 section 4.1). */
    act?: IdPOAuthAccessTokenActorJSON | undefined);
    static fromJSON(data: IdPOAuthAccessTokenJSON): IdPOAuthAccessToken;
    /**
     * Creates an IdPOAuthAccessToken from a JWT payload.
     * Maps standard JWT claims and OAuth-specific fields to token properties.
     * The raw JWT `aud` claim can be a string, string[], or undefined. It is normalized to string[].
     */
    static fromJwtPayload(payload: JwtPayload, clockSkewInMs?: number): IdPOAuthAccessToken;
}
//# sourceMappingURL=IdPOAuthAccessToken.d.ts.map