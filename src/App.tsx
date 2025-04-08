import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routers';

export default function APP() {
	return (
		<Router>
			<AppRoutes />
		</Router>
	);
}
