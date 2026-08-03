package com.dbtraining.reconx.dto;

import com.dbtraining.reconx.repository.entity.Trade;
import org.springframework.stereotype.Component;

@Component
public class TradeMapper {

    public TradeResponse toResponse(Trade trade) {
        if (trade == null) {
            return null;
        }

        return new TradeResponse(
                trade.getId(),
                trade.getTradeRef(),
                trade.getInstrument() != null ? trade.getInstrument().getId() : null,
                trade.getInstrument() != null ? trade.getInstrument().getSymbol() : null,
                trade.getCounterparty() != null ? trade.getCounterparty().getId() : null,
                trade.getCounterparty() != null ? trade.getCounterparty().getName() : null,
                trade.getAssetClass(),
                trade.getSide(),
                trade.getQuantity(),
                trade.getPrice(),
                trade.getTradeDate(),
                trade.getStatus(),
                trade.getCreatedAt(),
                trade.getModifiedAt()
        );
    }
}