import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { API_BASE_URL } from '~/config';

// Type Definitions
interface FormData {
    url: string;
}

interface CrawlerProps {
    setCrawlerImage: (image: string | null) => void;
    isCrawlerLoading: boolean;
    setIsCrawlerLoading: (loading: boolean) => void;
}

interface ApiResponse {
    image_base64: string;
    success: boolean;
}

interface ApiError {
    detail: string;
    status: number;
}

// Custom error class
class CrawlerError extends Error {
    constructor(
        message: string,
        public status?: number,
        public detail?: string
    ) {
        super(message);
        this.name = 'CrawlerError';
    }
}

const Crawler: React.FC<CrawlerProps> = ({
    setCrawlerImage,
    isCrawlerLoading,
    setIsCrawlerLoading
}) => {
    const [formData, setFormData] = useState<FormData>({ url: '' });
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const crawlerData = async (url: string): Promise<ApiResponse> => {
        if (!validateUrl(url)) {
            throw new CrawlerError('Invalid URL format');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/screenshot`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json() as ApiError;
                throw new CrawlerError(
                    'Server error',
                    response.status,
                    errorData.detail
                );
            }

            const responseData = await response.json() as ApiResponse;
            
            if (!responseData.image_base64) {
                throw new CrawlerError('No image data received from server');
            }

            return responseData;
        } catch (error) {
            if (error instanceof CrawlerError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new CrawlerError(error.message);
            }
            throw new CrawlerError('An unexpected error occurred');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsCrawlerLoading(true);

        try {
            if (!formData.url.trim()) {
                throw new CrawlerError('Please enter a valid URL.');
            }

            const result = await crawlerData(formData.url);
            setCrawlerImage(`data:image/jpeg;base64,${result.image_base64}`);
        } catch (error) {
            if (error instanceof CrawlerError) {
                setError(error.detail || error.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            setCrawlerImage(null);
        } finally {
            setIsCrawlerLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Box my={3}>
                <Typography
                    fontSize={24}
                    fontWeight={700}
                    textAlign="center"
                    id="dialog-title"
                >
                    generate-from-crawler
                </Typography>
                <Typography textAlign="center" id="dialog-description">
                    crawler-dialog-subtitle
                </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
                <Box>
                    <TextField
                        required
                        type="text"
                        id="url"
                        placeholder="generate-from-crawler"
                        fullWidth
                        variant="outlined"
                        value={formData.url}
                        onChange={handleChange}
                        disabled={isCrawlerLoading}
                        error={!!error}
                        helperText={error}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#d3d3d3',
                                    borderRadius: '15px',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#d3d3d3',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#d3d3d3',
                                },
                            },
                        }}
                    />
                    <Box mt={2}>
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            p={1}
                            border="1px solid #000"
                            borderRadius={3}
                            sx={{ 
                                background: '#000', 
                                cursor: isCrawlerLoading ? 'default' : 'pointer',
                                opacity: isCrawlerLoading ? 0.7 : 1,
                            }}
                            onClick={isCrawlerLoading ? undefined : handleSubmit}
                            component="button"
                            type="submit"
                        >
                            {isCrawlerLoading && (
                                <CircularProgress color="success" size={20} sx={{ mx: 1 }} />
                            )}
                            <Typography component="span" mr={1} color="#FFF">
                                generate
                            </Typography>
                            <i className="bi bi-arrow-right" />
                        </Box>
                        {isCrawlerLoading && (
                            <Box display="flex" justifyContent="center" mt={1} mb={2}>
                                <Typography>
                                    crawler-may-take-some-time please-wait...
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </form>
        </Box>
    );
};

export default Crawler;