package com.financemanager.backend.enumeration;

import lombok.Getter;

@Getter
public enum NotificationType {
    INFO("info"),
    SUCCESS("success"),
    DANGER("danger"),
    WARNING("warning");

    private final String label;

    NotificationType(String label) {
        this.label = label;
    }
}
