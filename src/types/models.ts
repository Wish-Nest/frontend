export interface Family {
    uuid: string;
    name: string;
    needAttention: boolean;
}

export interface UserFamily {
    uuid: string;
    userUuid: string;
    name: string;
    virtual: boolean;
    /** Ordonnancement par priorité de la liste (réglage serveur, défaut true). */
    priorityEnabled?: boolean;
    /** Image de profil du membre au sein de la famille (URL type /uploads/...), ou null. */
    image?: string | null;
}

export interface FamilyInvitation {
    uuid: string;
    email: string;
    familyUuid: string;
}

export interface GroupRequest {
    uuid: string;
    targetUuid: string;
    targetName: string;
    originName: string;
    originUuid: string;
    groupUuid: string;
    familyId: string;
}

export interface Invitation {
    uuid: string;
    familyName: string;
}

export type PrivateData = {
    additional_gifts: AdditionnalGift[]
} & {
    [id: string]: _GiftPrivateData
}

export type AdditionnalGift = (Gift & {
    byUserUuid: string
});

export function isAdditionnalGift(obj: any) : obj is AdditionnalGift {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.byUserUuid === "string" &&
        isGift(obj)
    );
}

export type _GiftPrivateData = {
    messages: GiftPrivateMessage[],
    takenBy?: null|string
}

export type GiftPrivateMessage = {
    content: string,
    timestamp: string,
    user_uuid: string
}

export type Gift = {
    uuid: string,
    title: string,
    content: string,
    additionalLinks?: string[],
    additional_links?: string[], // @deprecated use additionalLinks instead
    image?: string | null,
    position?: number
}

export function isGift(obj: any) : obj is Gift {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.uuid === "string" &&
        typeof obj.content === "string" &&
        typeof obj.title === "string"
    );
}