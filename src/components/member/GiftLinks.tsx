import React from 'react';
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getLinksFromGift, formatLinkLabel, copyToClipboard } from './helpers';

interface GiftLinksProps {
    links: string[];
}

export default function GiftLinks({ links }: GiftLinksProps) {
    const safeLinks = (links ?? []).filter(Boolean);
    if (safeLinks.length === 0) return null;

    return (
        <Box sx={{ mt: 1 }}>
            <Stack component="ul" sx={{ pl: 2, mt: 1 }}>
                {safeLinks.map((link, i) => (
                    <li key={i} style={{ listStyle: 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title={link}>
                                <a href={link} target="_blank" rel="noreferrer" style={{ maxWidth: '100%', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {formatLinkLabel(link)}
                                </a>
                            </Tooltip>
                            <IconButton size="small" aria-label="ouvrir" href={link} target="_blank" rel="noreferrer">
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" aria-label="copier" onClick={() => copyToClipboard(link)}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </li>
                ))}
            </Stack>
        </Box>
    );
}

