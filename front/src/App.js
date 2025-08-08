import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/Chat';
import Trends from './pages/Trends';
import LiteracyLab from './components/LiteracyLab';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/home" replace />} />
				<Route path="/home" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/chat" element={<Chat />} />
				<Route path="/trends" element={<Trends />} />
				<Route path="/literacy" element={<LiteracyLab />} />
				<Route path="*" element={<div className="p-6">404 Not Found</div>} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
