import React, {useEffect, useState} from 'react';
import {Divider, FormControlLabel, IconButton, LinearProgress, Stack, Switch, Typography, Alert} from "@mui/material";
import {DragIndicator, LowPriority} from "@mui/icons-material";
import GiftCard from './GiftCard';
import PrivateGiftCard from './PrivateGiftCard';
import {_GiftPrivateData, Gift} from "../../types/models";
import axios from "axios";
import {useFamily} from "../../provider/FamilyProvider";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

interface MemberGiftsProps {
    gifts: any[] | null;
    privateData: any;
    member: any;
    family: any;
    currentUserUuid?: string | undefined;
    fetchPrivateData?: (member: any) => void;
    refreshGifts?: () => void;
}

/**
 * Un cadeau public rendu dans un conteneur réordonnable (glisser-déposer).
 * N'importe quel morceau de carte peut être un jour un tel conteneur.
 */
function SortableGiftCard(props: React.ComponentProps<typeof GiftCard>) {
    const {gift, dragHandle: _ignored, ...giftCardProps} = props;
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: gift.uuid});

    const dragHandle = (
        <IconButton
            size="small"
            aria-label="Glisser pour réordonner ce cadeau"
            sx={{cursor: 'grab', color: 'text.secondary'}}
            {...attributes}
            {...listeners}
        >
            <DragIndicator fontSize="small"/>
        </IconButton>
    );

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1,
                position: 'relative',
                zIndex: isDragging ? 10 : undefined
            }}
        >
            <GiftCard gift={gift} {...giftCardProps} dragHandle={dragHandle}/>
        </div>
    );
}

export default function MemberGifts({ gifts, privateData, member, family, currentUserUuid, fetchPrivateData, refreshGifts }: MemberGiftsProps) {
    // Les hooks s'exécutent avant tout early return.
    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 6}}),
        useSensor(TouchSensor, {activationConstraint: {delay: 200, tolerance: 8}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
    );

    // Ordre local des cadeaux publics, éventuellement modifié par glisser-déposer.
    const [orderedGifts, setOrderedGifts] = useState<Gift[]>(Array.isArray(gifts) ? gifts : []);
    const [savingOrder, setSavingOrder] = useState(false);

    // Réglage serveur : ordonnancement par priorité de la liste (défaut : activé).
    const {selectFamily} = useFamily();
    const [priorityEnabled, setPriorityEnabled] = useState(member?.priorityEnabled !== false);
    const [prioritySaving, setPrioritySaving] = useState(false);

    // Synchronisation local <-> props (patron « stocker l'état d'un rendu précédent »).
    const [previousGifts, setPreviousGifts] = useState<any[] | null>(gifts);
    if (previousGifts !== gifts) {
        setPreviousGifts(gifts);
        setOrderedGifts(Array.isArray(gifts) ? gifts : []);
    }

    // Re-synchronisation du réglage quand on change de liste (le membre est une
    // copie figée : il n'est pas mis à jour par la relecture de la famille).
    const [previousMember, setPreviousMember] = useState<any>(member);
    if (previousMember !== member) {
        setPreviousMember(member);
        setPriorityEnabled(member?.priorityEnabled !== false);
    }

    if (!member) return null;

    const getGiftPrivateData = (giftUuid: string): false|_GiftPrivateData => {
        if (!privateData) {
            return false;
        }
        return privateData[giftUuid] || {messages: [], takenBy: null};
    }

    // Seul le propriétaire de la liste peut définir l'ordre de priorité de ses cadeaux.
    const canReorder = Boolean(currentUserUuid) && member.userUuid === currentUserUuid;
    // Le switch n'apparaît que sur sa propre liste, jamais sur un membre virtuel
    // (déjà écarté par canReorder — l'uuid d'un virtuel n'est pas celui de
    // l'utilisateur connecté — mais on le rend explicite).
    const canTogglePriority = canReorder && member.virtual !== true;
    // Les badges et le glisser-déposer suivent le réglage serveur, pour tous
    // les visiteurs de la liste.
    const reorderable = canReorder && priorityEnabled;
    const visibleGifts = canReorder ? orderedGifts : (Array.isArray(gifts) ? gifts : []);

    function saveOrder(next: Gift[]) {
        setSavingOrder(true);
        axios.put("/familymember/" + member.uuid + "/gift/order", {
            giftUuids: next.map((gift) => gift.uuid)
        }).catch((error) => {
            console.error("Failed to save gift order:", error);
            // Rollback sur l'ordre connu du serveur
            setOrderedGifts(Array.isArray(gifts) ? gifts : []);
        }).finally(() => setSavingOrder(false));
    }

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        const oldIndex = orderedGifts.findIndex((gift) => gift.uuid === active.id);
        const newIndex = orderedGifts.findIndex((gift) => gift.uuid === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const next = arrayMove(orderedGifts, oldIndex, newIndex);
        setOrderedGifts(next);
        saveOrder(next);
    }

    function handleTogglePriority(event: React.ChangeEvent<HTMLInputElement>) {
        const next = event.target.checked;
        setPriorityEnabled(next); // mise à jour optimiste
        setPrioritySaving(true);

        axios.put("/familymember/" + member.uuid + "/priority", {
            enabled: next
        }).then(() => {
            // Recharger la famille : les autres vues et une future sélection de
            // ce membre doivent refléter le réglage enregistré côté serveur.
            if (family?.uuid) {
                selectFamily(family.uuid);
            }
        }).catch((error) => {
            console.error("Failed to update priority ordering:", error);
            setPriorityEnabled(!next); // rollback sur l'état connu du serveur
        }).finally(() => setPrioritySaving(false));
    }

    const giftCardProps = (gift: any) => ({
        giftPrivateData: getGiftPrivateData(gift.uuid),
        onEdit: refreshGifts,
        onDelete: refreshGifts,
        onUpdatePrivate: () => { if (member) fetchPrivateData?.(member); }
    });

    return (
        <>
            {privateData === null && <Stack sx={{ mt: '2rem' }}>
                <LinearProgress />
            </Stack>}
            {privateData === false && member.userUuid !== currentUserUuid && <Alert severity={"error"}>
                Vous n'avez pas accès aux données privées de ce membre, veuillez attendre que quelqu'un vous y donne accès.
            </Alert>}

            {(canTogglePriority || visibleGifts.length > 1) && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1, mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                        {priorityEnabled && visibleGifts.length > 1 && (
                            <>
                                <LowPriority fontSize="inherit" color="primary" />
                                <Typography variant="caption" color="text.secondary">
                                    Ordonnés par priorité — <strong>1</strong> étant le cadeau le plus souhaité
                                    {canReorder ? ", glissez la poignée pour changer l'ordre" : ""}
                                    {savingOrder ? ' (enregistrement…)' : ''}.
                                </Typography>
                            </>
                        )}
                        {!priorityEnabled && (
                            <Typography variant="caption" color="text.secondary">
                                Ordonnancement par priorité désactivé — badges masqués pour tous les visiteurs
                                {prioritySaving ? ' (enregistrement…)' : ''}.
                            </Typography>
                        )}
                    </Stack>
                    {canTogglePriority && (
                        <FormControlLabel
                            sx={{ m: 0 }}
                            labelPlacement="start"
                            label={<Typography variant="caption" color="text.secondary">Par priorité</Typography>}
                            control={
                                <Switch
                                    size="small"
                                    checked={priorityEnabled}
                                    disabled={prioritySaving}
                                    onChange={handleTogglePriority}
                                    inputProps={{'aria-label': "Activer l'ordonnancement par priorité"}}
                                />
                            }
                        />
                    )}
                </Stack>
            )}

            {gifts !== null && (reorderable ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={visibleGifts.map((gift: any) => gift.uuid)}
                        strategy={verticalListSortingStrategy}
                    >
                        {visibleGifts.map((gift: any, index: number) => (
                            <SortableGiftCard
                                key={gift.uuid ?? index}
                                gift={gift}
                                priority={priorityEnabled && visibleGifts.length > 1 ? index + 1 : undefined}
                                {...giftCardProps(gift)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            ) : (
                visibleGifts.map((gift: any, index: number) => (
                    <GiftCard
                        key={gift.uuid ?? index}
                        gift={gift}
                        priority={priorityEnabled && visibleGifts.length > 1 ? index + 1 : undefined}
                        {...giftCardProps(gift)}
                    />
                ))
            ))}

            {gifts !== null && gifts.length !== 0 && privateData && privateData.additional_gifts.length !== 0 && <Divider sx={{ margin: "1rem" }} />}

            {privateData && privateData.additional_gifts && privateData.additional_gifts.map((gift: any, index: number) => (
                <PrivateGiftCard
                    key={gift.uuid ?? index}
                    gift={gift}
                    privateData={privateData}
                    currentUserUuid={currentUserUuid}
                    family={family}
                    onEdit={() => { if (member) fetchPrivateData?.(member); }}
                    onDelete={() => { if (member) fetchPrivateData?.(member); }}
                    onUpdatePrivate={() => { if (member) fetchPrivateData?.(member); }}
                />
            ))}

            {gifts !== null && privateData !== null && gifts.length === 0 && (!privateData || privateData.additional_gifts.length === 0) && <Typography sx={{ marginTop: '1rem' }}>
                Aucun cadeau n'a été ajouté à cette liste
            </Typography>}
        </>
    );
}
