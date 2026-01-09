-- =====================================================
-- MOOVELABS SECURITY FIX
-- Ajuste da trigger de geração de número de devis
-- =====================================================

-- Alterar a função para SECURITY DEFINER para que ela possa
-- ver todos os devis ao calcular o próximo número de sequência,
-- ignorando a restrição de RLS do usuário da sessão.
CREATE OR REPLACE FUNCTION public.generate_devis_numero()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
    year_part VARCHAR(4);
    sequence_num INTEGER;
    new_numero VARCHAR(50);
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    -- Esta consulta agora ignorará o RLS pois a função é SECURITY DEFINER
    -- de propriedade do usuário 'postgres' (Superusuário)
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(numero FROM 'DEV-\d{4}-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM devis
    WHERE numero LIKE 'DEV-' || year_part || '-%';
    
    new_numero := 'DEV-' || year_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
    NEW.numero := new_numero;
    
    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.generate_devis_numero() IS 'Gera número sequencial único ignorando RLS para evitar duplicatas';
