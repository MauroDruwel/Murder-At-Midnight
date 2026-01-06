import { Outlet, useLocation } from 'react-router-dom';
import BackButton from './BackButton';

function getBackConfig(pathname) {
  if (pathname.startsWith('/interviews/')) {
    return { label: 'BACK TO INTERVIEWS', fallbackTo: '/interviews' };
  }
  if (pathname.startsWith('/add-interview/new')) {
    return { label: 'BACK TO ADD INTERVIEW', fallbackTo: '/add-interview' };
  }
  if (pathname.startsWith('/add-interview')) {
    return { label: 'BACK TO TERMINAL', fallbackTo: '/' };
  }
  if (pathname.startsWith('/interviews')) {
    return { label: 'BACK TO TERMINAL', fallbackTo: '/' };
  }
  if (pathname.startsWith('/summaries')) {
    return { label: 'BACK TO TERMINAL', fallbackTo: '/' };
  }
  return { label: 'BACK', fallbackTo: '/' };
}

export default function AppFrame() {
  const location = useLocation();
  const showBack = location.pathname !== '/';
  const { label, fallbackTo } = getBackConfig(location.pathname);

  return (
    <>
      {showBack && <BackButton label={label} fallbackTo={fallbackTo} />}
      <Outlet />
    </>
  );
}
