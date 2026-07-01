package com.munglog.backend.domain.family.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.family.dto.CreateGroupRequest;
import com.munglog.backend.domain.family.dto.FamilyGroupResponse;
import com.munglog.backend.domain.family.dto.JoinGroupRequest;
import com.munglog.backend.domain.family.dto.TransferOwnerRequest;
import com.munglog.backend.domain.family.dto.UpdateGroupNameRequest;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 가족 그룹 컨트롤러.
 * 가족 그룹 생성, 가입, 탈퇴, 초대코드 관리 등의 REST API를 제공하는 클래스.
 * 주요 기능: 그룹 생성/가입/탈퇴, 초대코드 갱신, 그룹명 수정, 관리자 위임
 */
@RestController
@RequestMapping("/api/family")
@RequiredArgsConstructor
public class FamilyGroupController {

    private final FamilyGroupService familyGroupService;

    /**
     * [목적] 새로운 가족 그룹을 생성한다.
     * [설명] 이미 그룹에 속한 사용자는 그룹을 생성할 수 없다.
     *        name이 없으면 "{사용자명}의 가족"으로 자동 설정된다.
     *
     * @param request     그룹 생성 요청 (name 포함)
     * @param userDetails 로그인한 사용자 정보
     * @return 생성된 가족 그룹 응답
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> createGroup(
            @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(familyGroupService.createGroup(userId, request.getName())));
    }

    /**
     * [목적] 초대 코드를 입력하여 가족 그룹에 가입한다.
     * [설명] 개인 그룹(1인)에 속한 상태에서 가입하면 기존 데이터가 가족 그룹으로 이전된다.
     *        다른 구성원이 있는 그룹에 속한 경우 먼저 탈퇴해야 한다.
     *
     * @param request     초대 코드 요청 (inviteCode 포함)
     * @param userDetails 로그인한 사용자 정보
     * @return 가입된 가족 그룹 응답
     */
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> joinGroup(
            @RequestBody JoinGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(familyGroupService.joinGroup(userId, request.getInviteCode())));
    }

    /**
     * [목적] 내가 속한 가족 그룹 정보를 조회한다.
     * [설명] 그룹 ID, 이름, 초대 코드, 내 역할, 구성원 목록을 반환한다.
     *
     * @param userDetails 로그인한 사용자 정보
     * @return 내 가족 그룹 응답
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> getMyGroup(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(familyGroupService.getMyGroup(userId)));
    }

    /**
     * [목적] 가족 그룹의 초대 코드를 새로 발급한다.
     * [설명] 그룹 관리자(OWNER)만 초대 코드를 갱신할 수 있다.
     *
     * @param userDetails 로그인한 사용자 정보
     * @return 새로 발급된 초대 코드 문자열
     */
    @PostMapping("/invite-code/refresh")
    public ResponseEntity<ApiResponse<String>> refreshInviteCode(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(familyGroupService.refreshInviteCode(userId)));
    }

    /**
     * [목적] 가족 그룹 이름을 수정한다.
     * [설명] 그룹 관리자(OWNER)만 이름을 변경할 수 있다.
     *
     * @param request     그룹명 수정 요청 (name 포함)
     * @param userDetails 로그인한 사용자 정보
     * @return 수정된 가족 그룹 응답
     */
    @PatchMapping("/name")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> updateGroupName(
            @RequestBody UpdateGroupNameRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                familyGroupService.updateGroupName(userId, request.getName())));
    }

    /**
     * [목적] 가족 그룹 관리자 권한을 다른 구성원에게 위임한다.
     * [설명] 현재 관리자(OWNER)만 호출 가능하며, 자기 자신에게 위임할 수 없다.
     *
     * @param request     위임 요청 (newOwnerUserId 포함)
     * @param userDetails 로그인한 사용자 정보
     * @return 권한 위임 후 가족 그룹 응답
     */
    @PostMapping("/transfer-owner")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> transferOwner(
            @RequestBody TransferOwnerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                familyGroupService.transferOwnership(userId, request.getNewOwnerUserId())));
    }

    /**
     * [목적] 가족 그룹에서 탈퇴한다.
     * [설명] 관리자가 탈퇴하려면 먼저 다른 구성원에게 권한을 위임해야 한다.
     *        탈퇴 후 자동으로 새 개인 그룹이 생성된다.
     *
     * @param userDetails 로그인한 사용자 정보
     * @return 탈퇴 후 새로 생성된 개인 그룹 응답
     */
    @DeleteMapping("/leave")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> leaveGroup(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        FamilyGroupResponse newGroup = familyGroupService.leaveGroup(userId);
        return ResponseEntity.ok(ApiResponse.success(newGroup));
    }
}
