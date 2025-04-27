import React from "react";

interface UserGreetingProps {
  displayName: string;
  email: string;
}

const UserGreeting: React.FC<UserGreetingProps> = ({ displayName, email }) => (
  <div className="mb-6 flex flex-col items-start">
    <span className="text-lg font-semibold truncate">Hi, {displayName ? displayName : email ? email : "User"}!</span>
  </div>
);

export default UserGreeting; 