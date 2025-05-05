import { useEffect, useState } from 'react';

const useGeolocation = () => {
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const handleSuccess = (position: GeolocationPosition) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
            setLoading(false);
        };

        const handleError = (error: GeolocationPositionError) => {
            setError(error.message);
            setLoading(false);
        };

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
        } else {
            setError('Geolocation is not supported by this browser.');
            setLoading(false);
        }
    }, []);

    return { latitude, longitude, error, loading };
};

export default useGeolocation;