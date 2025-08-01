package com.genx.controller;

import com.genx.dto.response.ApiResponse;
import com.genx.dto.response.NotificationResponse;
import com.genx.entity.Notification;
import com.genx.entity.User;
import com.genx.mapper.NotificationMapper;
import com.genx.security.SecurityUtil;
import com.genx.service.interfaces.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private NotificationMapper notificationMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications() {
        User user = getCurrentUser();
        List<Notification> entities = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thông báo thành công", notificationMapper.toResponseList(entities)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<Long>> countUnread() {
        User user = getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Số lượng thông báo chưa đọc", notificationService.countUnread(user)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã đọc", null));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.success("Tất cả thông báo đã được đánh dấu là đã đọc", null));
    }

    private User getCurrentUser() {
        return SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new SecurityException("Không thể lấy thông tin người dùng hiện tại."));
    }
}
