import React, {useEffect, useState} from 'react';
import {Divider, IconButton, LinearProgress, Stack, Typography, Alert} from "@mui/material";
import {DragIndicator, LowPriority} from "@mui/icons-material";
import GiftCard from './GiftCard';
import PrivateGiftCard from './PrivateGiftCard';
import {_GiftPrivateData, Gift} from "../../types/models";
import axios from "axios";
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

    // Synchronisation local <-> props (patron « stocker l'état d'un rendu précédent »).
    const [previousGifts, setPreviousGifts] = useState<any[] | null>(gifts);
    if (previousGifts !== gifts) {
        setPreviousGifts(gifts);
        setOrderedGifts(Array.isArray(gifts) ? gifts : []);
    }

    if (!member) return null;

    const getGiftPrivateData = (giftUuid: string): _GiftPrivateData => {
        if (!privateData) {
            return {messages: [], takenBy: null};
        }
        return privateData[giftUuid] || {messages: [], takenBy: null};
    }

    // Seul le propriétaire de la liste peut définir l'ordre de priorité de ses cadeaux.
    const canReorder = Boolean(currentUserUuid) && member.userUuid === currentUserUuid;
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

            {visibleGifts.length > 1 && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <LowPriority fontSize="inherit" color="primary" />
                    <Typography variant="caption" color="text.secondary">
                        Ordonnés par priorité — <strong>1</strong> étant le cadeau le plus souhaité
                        {canReorder ? ", glissez la poignée pour changer l'ordre" : ""}
                        {savingOrder ? ' (enregistrement…)' : ''}.
                    </Typography>
                </Stack>
            )}

            {gifts !== null && (canReorder ? (
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
                                priority={visibleGifts.length > 1 ? index + 1 : undefined}
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
                        priority={visibleGifts.length > 1 ? index + 1 : undefined}
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
