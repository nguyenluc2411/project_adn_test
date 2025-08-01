package com.genx.service.interfaces;

import com.genx.entity.Payment;

public interface IPaymentService {
    Payment getPaymentByOrderId(String orderId);
}
