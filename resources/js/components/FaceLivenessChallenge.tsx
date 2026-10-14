import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import '@aws-amplify/ui-react-liveness/styles.css';

type FaceLivenessChallengeProps = {
    sessionId: string;
    region: string;
    onAnalysisComplete: () => Promise<void>;
    onCancel: () => void;
    onError: (message: string) => void;
};

export default function FaceLivenessChallenge({
    sessionId,
    region,
    onAnalysisComplete,
    onCancel,
    onError,
}: FaceLivenessChallengeProps) {
    function handleError(error: { error: Error }) {
        const errorName = error.error.name;
        const errorMessage = error.error.message.toLowerCase();

        if (
            errorName === 'NotAllowedError' ||
            errorName === 'PermissionDeniedError' ||
            errorName === 'SecurityError'
        ) {
            onError(
                'Camera access was blocked. Allow camera permission for this site, then try again.',
            );

            return;
        }

        if (
            errorName === 'NotFoundError' ||
            errorName === 'DevicesNotFoundError'
        ) {
            onError('No camera was found. Connect a camera and try again.');

            return;
        }

        if (
            errorName === 'NotReadableError' ||
            errorName === 'TrackStartError'
        ) {
            onError(
                'The camera could not be started. Close other apps using it, then try again.',
            );

            return;
        }

        if (
            errorName === 'NetworkError' ||
            errorName === 'TimeoutError' ||
            errorMessage.includes('network') ||
            errorMessage.includes('fetch')
        ) {
            onError(
                'Could not reach the face verification service. Check your internet connection and try again.',
            );

            return;
        }

        if (
            errorMessage.includes('accessdenied') ||
            errorMessage.includes('not authorized') ||
            errorMessage.includes('credentials') ||
            errorMessage.includes('identity pool')
        ) {
            onError(
                'AWS face verification permissions need attention. Please contact the site administrator.',
            );

            return;
        }

        onError(
            'Face liveness could not be completed. Check camera access and your connection, then try again.',
        );
    }

    return (
        <FaceLivenessDetector
            sessionId={sessionId}
            region={region}
            onAnalysisComplete={onAnalysisComplete}
            onUserCancel={onCancel}
            onError={handleError}
        />
    );
}
