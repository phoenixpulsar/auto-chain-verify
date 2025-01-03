
import { useEffect, useState, useContext } from 'react';

import { NearContext } from '@/context';
import NearLogo from '/public/near-logo.svg';

export const Navigation = () => {
  const { signedAccountId, wallet } = useContext(NearContext);
  const [action, setAction] = useState(() => { });
  const [label, setLabel] = useState('Loading...');

  useEffect(() => {
    if (!wallet) return;

    if (signedAccountId) {
      setAction(() => wallet.signOut);
      setLabel(`Logout ${signedAccountId}`);
    } else {
      setAction(() => wallet.signIn);
      setLabel('Login');
    }
  }, [signedAccountId, wallet]);

  return (
    <nav className="">
      <div className="">
       
        <img 
        src="/near-logo.svg"
        alt="NEAR"
        width="30"
        height="24"
        loading="lazy"
      />
        <div className=''>
          <button className="" onClick={action} > {label} </button>
        </div>
      </div>
    </nav>
  );
};