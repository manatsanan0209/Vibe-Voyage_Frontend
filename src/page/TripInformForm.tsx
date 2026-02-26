import InformationForm from '@/components/TripInformation/InformationForm';

export default function TripInformForm() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-white my-auto">
            <div className="w-11/12 h-11/12 rounded-3xl shadow-lg flex items-center justify-center bg-violet-50 p-8">
                <InformationForm />
            </div>
        </div>
    );
}
