import React from 'react';

interface ProfileCircleProps {
  name: string;
  onClick?: () => void;
  isImage?: boolean;
  isEditable?: boolean;
}

const ProfileCircle: React.FC<ProfileCircleProps> = ({ name, onClick, isImage = false, isEditable = false }) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="profile-circle" onClick={onClick}>
      {isImage ? (
        <img src="" alt="Profile" className="profile-circle__image" />
      ) : (
        <span className="profile-circle__initial">{initial}</span>
      )}
      {isEditable && (
        <div className="profile-circle__edit-icon"></div>
      )}
    </div>
  );
};

export default ProfileCircle;
