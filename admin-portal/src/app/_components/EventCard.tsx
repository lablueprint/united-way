import React, { useState, useEffect } from 'react';

function Button() {
    const [buttonText, setButtonText] = useState('Click me, please');
    function handleClick() {
        return setButtonText('Thanks, been clicked!');
    }
    return <button onClick={handleClick}>{buttonText}</button>;
}

export default function EventCard() {    
    return (
        <div>
            Welcome to the test landing page.
            <form>
                <label>
                    Name:
                    <input type="text" name="name" />
                </label>
                <Button/>
            </form>
        </div>
    );
}


//https://www.w3schools.com/react/react_class.asp
