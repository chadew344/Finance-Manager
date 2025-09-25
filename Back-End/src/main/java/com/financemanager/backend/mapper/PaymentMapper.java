package com.financemanager.backend.mapper;

import com.financemanager.backend.dto.payment.PaymentDto;
import com.financemanager.backend.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentDto toDto(Payment payment);

    @Mapping(target = "id", ignore = true)
    Payment toEntity(PaymentDto paymentDto);
}
