package com.genx.mapper;
import com.genx.dto.response.PaymentResponse;
import com.genx.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(source = "id", target = "id")
    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "transactionNo", target = "transactionNo")
    @Mapping(source = "responseCode", target = "responseCode")
    @Mapping(source = "payDate", target = "payDate")
    PaymentResponse toDTO(Payment payment);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "transactionNo", target = "transactionNo")
    @Mapping(source = "responseCode", target = "responseCode")
    @Mapping(source = "payDate", target = "payDate")
    Payment toEntity(PaymentResponse paymentResponse);


}