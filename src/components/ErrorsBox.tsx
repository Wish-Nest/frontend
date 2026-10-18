import {useState} from "react";
import {Card, CardContent} from "@mui/material";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import axios from "axios";

export default function ErrorsBox() {
    const [errors, setErrors] = useState<string[]>([]);

    function addError(error: string) {
        setErrors([...errors, error]);
        setTimeout(() => {
            setErrors(errors.filter(e => e !== error));
        }, 5000);
    }

    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if(error.response.status !== 403){
                addError(error.message + ": " + error.response?.data?.message);
            }
        }
    )

    return (
        <Stack
            spacing={2}
            sx={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 1000,
                width: '20%',
            }}
        >
            {errors.map((error, index) => {
                return <Card className="MuiCard-error" sx={{
                    padding: 0
                }} key={index}>
                    <CardContent sx={{
                        padding: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <Typography gutterBottom>{error}</Typography>
                    </CardContent>
                </Card>
            })}
        </Stack>
    );
}