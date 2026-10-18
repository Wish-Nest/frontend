import { useEffect, useState } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import { APP_VERSION } from '../../env';

export default function VersionInfo() {
    const [backendVersion, setBackendVersion] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        axios.get('/version')
            .then(response => {
                if (!cancelled) {
                    setBackendVersion(response.data?.version ?? null);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setFailed(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const backendLabel = failed ? '?' : (backendVersion ?? '…');

    return (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Frontend v{APP_VERSION} · Backend v{backendLabel}
        </Typography>
    );
}
