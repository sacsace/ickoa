import type { LeadershipCard } from "@/lib/leadership";
import { groupByLevel } from "@/lib/leadership";

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-brand/15"
      />
    );
  }
  return (
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
      {name.charAt(0)}
    </span>
  );
}

function MemberCard({ member }: { member: LeadershipCard }) {
  return (
    <article className="w-full max-w-[220px] border border-border bg-card px-4 py-5 text-center shadow-sm">
      <Avatar name={member.name} image={member.image} />
      <p className="mt-3 text-xs font-semibold tracking-wide text-brand">{member.role}</p>
      <p className="mt-1 text-base font-bold">{member.name}</p>
      {member.nameEn ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{member.nameEn}</p>
      ) : null}
      {member.bio ? (
        <p className="mt-2 whitespace-pre-wrap text-left text-xs leading-relaxed text-muted-foreground">
          {member.bio}
        </p>
      ) : null}
    </article>
  );
}

export function LeadershipOrgChart({ members }: { members: LeadershipCard[] }) {
  const rows = groupByLevel(members);

  return (
    <div className="mx-auto w-full max-w-[1356px]">
      <div className="flex flex-col items-center">
        {rows.map((row, rowIndex) => (
          <div key={row.level} className="flex w-full flex-col items-center">
            {rowIndex > 0 ? (
              <div className="flex h-8 flex-col items-center" aria-hidden>
                <span className="h-full w-px bg-border" />
              </div>
            ) : null}

            <div className="relative flex w-full flex-wrap items-start justify-center gap-4 md:gap-6">
              {row.items.length > 1 ? (
                <span
                  className="pointer-events-none absolute left-[12%] right-[12%] top-0 hidden h-px bg-border md:block"
                  aria-hidden
                />
              ) : null}
              {row.items.map((member) => (
                <div key={member.id} className="relative flex flex-col items-center pt-0 md:pt-3">
                  {row.items.length > 1 ? (
                    <span
                      className="mb-2 hidden h-3 w-px bg-border md:block"
                      aria-hidden
                    />
                  ) : null}
                  <MemberCard member={member} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
