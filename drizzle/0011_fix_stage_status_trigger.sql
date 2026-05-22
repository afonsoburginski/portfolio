-- Conserta o trigger de status:
--   ANTES: criar/atualizar qualquer stage → request vira "in_progress"
--          (mesmo sem nenhum pagamento e sem trabalho começado)
--   AGORA: status só transiciona se houver sinal real de trabalho/pagamento:
--          - alguma stage com work_status != 'not_started'
--          - OU alguma stage com status='paid'
--          - OU todas as stages não-extras com work_status='done' → 'delivered'
--          Caso contrário, mantém o status atual (geralmente 'quoted').

DROP TRIGGER IF EXISTS request_stages_derive_status_ai;
DROP TRIGGER IF EXISTS request_stages_derive_status_au;
DROP TRIGGER IF EXISTS request_stages_derive_status_ad;

CREATE TRIGGER request_stages_derive_status_ai
AFTER INSERT ON request_stages
FOR EACH ROW
BEGIN
  UPDATE requests
  SET status = CASE
    WHEN status IN ('cancelled', 'rejected', 'approved') THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND is_extra = 0) = 0 THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND is_extra = 0 AND work_status != 'done') = 0 THEN 'delivered'
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND (status = 'paid' OR work_status != 'not_started')) > 0 THEN 'in_progress'
    ELSE status
  END,
  updated_at = datetime('now')
  WHERE id = NEW.request_id;
END;

CREATE TRIGGER request_stages_derive_status_au
AFTER UPDATE ON request_stages
FOR EACH ROW
BEGIN
  UPDATE requests
  SET status = CASE
    WHEN status IN ('cancelled', 'rejected', 'approved') THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND is_extra = 0) = 0 THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND is_extra = 0 AND work_status != 'done') = 0 THEN 'delivered'
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND (status = 'paid' OR work_status != 'not_started')) > 0 THEN 'in_progress'
    ELSE status
  END,
  updated_at = datetime('now')
  WHERE id = NEW.request_id;
END;

CREATE TRIGGER request_stages_derive_status_ad
AFTER DELETE ON request_stages
FOR EACH ROW
BEGIN
  UPDATE requests
  SET status = CASE
    WHEN status IN ('cancelled', 'rejected', 'approved') THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = OLD.request_id AND is_extra = 0) = 0 THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = OLD.request_id AND is_extra = 0 AND work_status != 'done') = 0 THEN 'delivered'
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = OLD.request_id AND (status = 'paid' OR work_status != 'not_started')) > 0 THEN 'in_progress'
    ELSE status
  END,
  updated_at = datetime('now')
  WHERE id = OLD.request_id;
END;

-- Reset: para requests que estão 'in_progress' mas não têm pagamento nem trabalho
-- iniciado nas etapas, volta para 'quoted'. Não toca em terminal states.
UPDATE requests
SET status = 'quoted', updated_at = datetime('now')
WHERE status = 'in_progress'
  AND id IN (SELECT DISTINCT request_id FROM request_stages)
  AND id NOT IN (
    SELECT DISTINCT request_id FROM request_stages
    WHERE status = 'paid' OR work_status != 'not_started'
  );
