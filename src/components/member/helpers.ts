// Helpers pour la gestion des liens des cadeaux
export function getLinksFromGift(gift: any): string[] {
    if (!gift) return [];
    return gift.additionalLinks ?? gift.additional_links ?? [];
}

export function formatLinkLabel(link: string, maxLen = 60): string {
    if (!link) return '';
    try {
        const u = new URL(link);
        const base = u.hostname + u.pathname;
        if (base.length <= maxLen) return base;
        return base.slice(0, maxLen - 3) + '...';
    } catch (e) {
        // Si ce n'est pas une URL valide, tronquer la chaîne brute
        if (link.length <= maxLen) return link;
        return link.slice(0, maxLen - 3) + '...';
    }
}

export async function copyToClipboard(text: string) {
    if (!text) return;
    try {
        if (navigator && typeof navigator.clipboard?.writeText === 'function') {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback: créer un textarea temporaire
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
            } finally {
                document.body.removeChild(textarea);
            }
        }
    } catch (err) {
        // Ne pas faire échouer l'application si le copier échoue
        // On log pour le debug
        // eslint-disable-next-line no-console
        console.error('Copy to clipboard failed', err);
    }
}
