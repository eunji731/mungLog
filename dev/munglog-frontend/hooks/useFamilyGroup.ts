import { useState, useEffect, useCallback } from 'react';
import { familyGroupApi, type FamilyGroupInfo } from '@/api/familyGroupApi';

export const useFamilyGroup = () => {
  const [group, setGroup] = useState<FamilyGroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await familyGroupApi.getMyGroup();
      setGroup(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setGroup(null);
      } else {
        setError('그룹 정보를 불러오지 못했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const createGroup = async (name: string) => {
    const res = await familyGroupApi.createGroup(name);
    setGroup(res.data);
  };

  const joinGroup = async (inviteCode: string) => {
    const res = await familyGroupApi.joinGroup(inviteCode);
    setGroup(res.data);
  };

  const refreshInviteCode = async () => {
    const res = await familyGroupApi.refreshInviteCode();
    if (group) {
      setGroup({ ...group, inviteCode: res.data });
    }
  };

  const updateGroupName = async (name: string) => {
    const res = await familyGroupApi.updateGroupName(name);
    setGroup(res.data);
  };

  const transferOwner = async (newOwnerUserId: string) => {
    const res = await familyGroupApi.transferOwner(newOwnerUserId);
    setGroup(res.data);
  };

  const leaveGroup = async () => {
    await familyGroupApi.leaveGroup();
    setGroup(null);
  };

  return {
    group,
    isLoading,
    error,
    hasGroup: group !== null,
    refetch: fetchGroup,
    createGroup,
    joinGroup,
    refreshInviteCode,
    updateGroupName,
    transferOwner,
    leaveGroup,
  };
};
