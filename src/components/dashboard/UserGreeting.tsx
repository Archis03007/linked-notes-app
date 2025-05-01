import React from "react";

interface UserGreetingProps {
  displayName: string;
  email: string;
}

const UserGreeting: React.FC<UserGreetingProps> = ({ displayName, email }) => (
  <div className="flex items-center w-full">
    <span className="text-base font-semibold truncate">Hi, {displayName ? displayName : email ? email : "User"}!</span>
  </div>
);

export default UserGreeting; 