import { Route, Routes } from 'react-router-dom'

import Home from './page/Home'
import NotFound from './page/NotFound'
import SignIn from './page/SignIn'
import SignUp from './page/SignUp'

export function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/signin" element={<SignIn />} />
			<Route path="/signup" element={<SignUp />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	)
}

export default App