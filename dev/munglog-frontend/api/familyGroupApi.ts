import { apiClient } from '@/lib/apiClient';

export interface GroupMember {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  role: 'OWNER' | 'MEMBER';
}

export interface FamilyGroupInfo {
  groupId: string;
  name: string;
  inviteCode: string;
  myRole: 'OWNER' | 'MEMBER';
  members: GroupMember[];
}

export const familyGroupApi = {
  getMyGroup: () => apiClient.get<FamilyGroupInfo>('/family/my'),
  createGroup: (name: string) => apiClient.post<FamilyGroupInfo>('/family/create', { name }),
  joinGroup: (inviteCode: string) => apiClient.post<FamilyGroupInfo>('/family/join', { inviteCode }),
  refreshInviteCode: () => apiClient.post<string>('/family/invite-code/refresh'),
  transferOwner: (newOwnerUserId: string) =>
    apiClient.post<FamilyGroupInfo>('/family/transfer-owner', { newOwnerUserId }),
  leaveGroup: () => apiClient.delete('/family/leave'),
};
