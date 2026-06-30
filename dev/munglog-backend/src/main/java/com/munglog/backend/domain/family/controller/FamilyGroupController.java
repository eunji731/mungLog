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

@RestController
@RequestMapping("/api/family")
@RequiredArgsConstructor
public class FamilyGroupController {

    private final FamilyGroupService familyGroupService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> createGroup(
            @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(familyGroupService.createGroup(userId, request.getName())));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> joinGroup(
            @RequestBody JoinGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(familyGroupService.joinGroup(userId, request.getInviteCode())));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> getMyGroup(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(familyGroupService.getMyGroup(userId)));
    }

    @PostMapping("/invite-code/refresh")
    public ResponseEntity<ApiResponse<String>> refreshInviteCode(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(familyGroupService.refreshInviteCode(userId)));
    }

    @PatchMapping("/name")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> updateGroupName(
            @RequestBody UpdateGroupNameRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                familyGroupService.updateGroupName(userId, request.getName())));
    }

    @PostMapping("/transfer-owner")
    public ResponseEntity<ApiResponse<FamilyGroupResponse>> transferOwner(
            @RequestBody TransferOwnerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                familyGroupService.transferOwnership(userId, request.getNewOwnerUserId())));
    }

    @DeleteMapping("/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        familyGroupService.leaveGroup(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
