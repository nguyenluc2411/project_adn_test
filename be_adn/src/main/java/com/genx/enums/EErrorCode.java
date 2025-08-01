package com.genx.enums;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum EErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception");

    int code;
    String message;
}
