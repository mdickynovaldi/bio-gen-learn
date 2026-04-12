alter table public.ethics_cases
add column detail text;

update public.ethics_cases
set detail = case
  when content_type = 'text' and nullif(btrim(content_value), '') is not null
    then content_value
  else concat(
    summary,
    case
      when content_type in ('pdf', 'link')
        then E'\n\nSumber pendukung tersedia melalui tautan atau lampiran yang menyertai kasus ini.'
      else ''
    end
  )
end
where detail is null;

alter table public.ethics_cases
alter column detail set not null;

alter table public.ethics_cases
add constraint ethics_cases_detail_not_blank
check (char_length(btrim(detail)) > 0);
