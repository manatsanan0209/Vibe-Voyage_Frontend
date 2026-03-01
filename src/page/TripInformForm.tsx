import { useState } from 'react';
import InformationForm from '@/components/TripInformation/InformationForm';
import TravelVibeStep, {
    type VibeFormData,
} from '@/components/TripInformation/TravelVibeStep';

export default function TripInformForm() {
    const [step, setStep] = useState<1 | 2>(1);

    function handleVibeSubmit(form: VibeFormData) {
        console.log('Travel Vibe Questionnaire:', form);
        // TODO: submit full trip + vibe data to API
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-white my-auto">
            <div className="w-11/12 h-11/12 rounded-3xl shadow-lg flex items-center justify-center bg-violet-50 p-8">
                {step === 1 ? (
                    <InformationForm onNext={() => setStep(2)} />
                ) : (
                    <TravelVibeStep
                        onBack={() => setStep(1)}
                        onSubmit={handleVibeSubmit}
                    />
                )}
            </div>
        </div>
    );
}
