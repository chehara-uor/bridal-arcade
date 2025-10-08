import React from 'react';
import '../styles/Preloader.css'
export default function Preloader() {
  
  return (
    <div id="Reactpreloader">
      <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  );
}