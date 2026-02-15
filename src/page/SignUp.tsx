import AuthLogo from '../components/auth/AuthLogo'
import FormSignup from '../components/auth/signUp/FormSignUp'
import { Button } from "@/components/ui/button"
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpeg"


export default function SignUp() {
    const navigate = useNavigate();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-14 bg-violet-200">
         <div className="w-11/12 h-11/12 flex flex-col md:flex-row rounded-4xl bg-white shadow-lg overflow-hidden">
           <div className="w-full md:w-1/2 h-full relative">
              <img src={bg} className="w-full h-full object-cover" alt="Background" />
             <Button onClick={() => navigate(-1)} className="absolute left-4 top-4 text-purple-50 bg-white/10 hover:bg-white/20"> <IoArrowBack />Back</Button>
           </div>
           <div className="w-full md:w-1/2 flex h-full flex-col items-center justify-center px-6 py-10">
             <AuthLogo />
             <FormSignup  />
           </div>
         </div>
       </div>
  )
}
