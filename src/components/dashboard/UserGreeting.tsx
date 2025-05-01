import React from "react";

interface UserGreetingProps {
  displayName: string;
  email: string;
}

const UserGreeting: React.FC<UserGreetingProps> = ({ displayName, email }) => (
  <div className="flex justify-center w-full">
    <span className="text-lg font-semibold truncate">Hi, {displayName ? displayName : email ? email : "User"}!</span>
  </div>
);

export default UserGreeting; 