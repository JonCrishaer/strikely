import Dashboard from './pages/Dashboard';
import Positions from './pages/Positions';
import AddPosition from './pages/AddPosition';
import Performance from './pages/Performance';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';
import PostDetails from './pages/PostDetails';
import Community from './pages/Community';
import FeatureRequests from './pages/FeatureRequests';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Positions": Positions,
    "AddPosition": AddPosition,
    "Performance": Performance,
    "Home": Home,
    "Pricing": Pricing,
    "Admin": Admin,
    "PostDetails": PostDetails,
    "Community": Community,
    "FeatureRequests": FeatureRequests,
    "Journal": Journal,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};