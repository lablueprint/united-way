"use client";
import { useDispatch } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import OrganizationProfile from '../../_components/OrganizationProfile';
import UpcomingCalendar from "@/app/_components/UpcomingCalendar";


export default function Landing() {
  const dispatch = useDispatch();
  const router = useRouter();

  const dispatchLogout = async () => {
    await dispatch(logout());
  }

  return (
    <div>
      Welcome to the test landing page.
      <OrganizationProfile></OrganizationProfile>
      <button
        onClick={() => {
          console.log("Result: ", exampleGetToRoot());
        }}
      >
        Example HTTP Request button
      </button><br />

      <button onClick={() => { dispatchLogout(); router.push('/sign-up'); }}>
        Log out
      </button>
    </div>
  );
}