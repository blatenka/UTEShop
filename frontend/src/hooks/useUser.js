import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile } from "../store/userSlice";

export const useUser = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.user);

  return {
    profile,
    loading,
    error,
    fetchProfile: () => dispatch(fetchProfile()),
    updateProfile: (data) => dispatch(updateProfile(data)),
  };
};
