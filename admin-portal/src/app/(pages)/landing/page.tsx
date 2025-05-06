"use client";
import { useDispatch } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import { useRouter } from 'next/navigation';
import OrganizationProfile from '../../_components/OrganizationProfile';

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
      {/* Org: {org.orgId}<br />
      Auth: {org.authToken}<br />
      Refresh: {org.refreshToken}<br /> */}
      <button onClick={() => { dispatchLogout(); router.push('/sign-up'); }}>
        Log out
      </button>
      {/* <div>Result: {responseValue}</div> */}
    </div>
  );
}