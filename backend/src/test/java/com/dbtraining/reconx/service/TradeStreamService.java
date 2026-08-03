package com.dbtraining.reconx.service;

import com.dbtraining.reconx.dto.TradeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TradeStreamService {

    private static final Logger log = LoggerFactory.getLogger(TradeStreamService.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final AtomicLong tradeCounter = new AtomicLong(100);

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L); // infinite timeout
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((ex) -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data(Map.of("status", "connected", "message", "Trade stream established")));
            TradeResponse initTrade = generateSampleTrade();
            emitter.send(SseEmitter.event().data(initTrade));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    @Scheduled(fixedRate = 4000)
    public void generatePeriodicTrade() {
        if (emitters.isEmpty()) {
            return;
        }
        TradeResponse sample = generateSampleTrade();
        broadcast(sample);
    }

    private void broadcast(TradeResponse trade) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().data(trade));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    private TradeResponse generateSampleTrade() {
        long id = tradeCounter.incrementAndGet();
        String[] refs = {"EQU-LIVE-", "FX-LIVE-", "BOND-LIVE-"};
        String[] symbols = {"AAPL", "MSFT", "EUR/USD", "US10Y", "NVDA", "TSLA"};
        String[] counterparties = {"Goldman Sachs", "JP Morgan", "Morgan Stanley", "UBS", "Barclays"};
        String[] statuses = {"PENDING", "MATCHED", "UNMATCHED", "DISPUTED"};

        String refPrefix = refs[(int) (id % refs.length)];
        String symbol = symbols[(int) (id % symbols.length)];
        String cp = counterparties[(int) (id % counterparties.length)];
        String status = statuses[(int) (id % statuses.length)];

        BigDecimal qty = BigDecimal.valueOf((id % 10 + 1) * 100);
        BigDecimal price = BigDecimal.valueOf(100.0 + (id % 50));

        return new TradeResponse(
                id,
                refPrefix + String.format("%04d", id),
                (id % 6) + 1,
                symbol,
                (id % 5) + 1,
                cp,
                "EQUITY",
                "BUY",
                qty,
                price,
                LocalDate.now(),
                status,
                Instant.now(),
                Instant.now()
        );
    }
}