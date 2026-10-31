type Attendee = {
  id: string;
  checkedIn: boolean;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
};

export function EventAttendees({
  attendees,
  maxAttendees,
}: {
  attendees: Attendee[];
  maxAttendees: number;
}) {
  const checkedInCount = attendees.filter((a) => a.checkedIn).length;

  return (
    <section className="mt-8 border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-4 md:px-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            참가 신청자
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            등록자만 볼 수 있는 목록입니다.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{attendees.length}</span>
          {" / "}
          {maxAttendees}명
          {attendees.length > 0 ? (
            <span className="ml-2 text-xs">
              · 체크인 {checkedInCount}명
            </span>
          ) : null}
        </p>
      </div>

      {attendees.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground md:px-5">
          아직 참가 신청한 사람이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px] leading-snug">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="w-12 px-3 py-2.5 text-center font-medium">번호</th>
                <th className="px-3 py-2.5 text-left font-medium">이름</th>
                <th className="px-3 py-2.5 text-left font-medium">연락처</th>
                <th className="w-28 px-3 py-2.5 text-center font-medium">신청일</th>
                <th className="w-20 px-3 py-2.5 text-center font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((item, index) => {
                const contact = item.user.phone || item.user.email || "—";
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-3 text-center text-muted-foreground">
                      {attendees.length - index}
                    </td>
                    <td className="px-3 py-3 font-medium text-foreground">
                      {item.user.name?.trim() || "이름 없음"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {item.user.phone ? (
                        <a
                          href={`tel:${item.user.phone}`}
                          className="hover:text-foreground hover:underline"
                        >
                          {item.user.phone}
                        </a>
                      ) : item.user.email ? (
                        <a
                          href={`mailto:${item.user.email}`}
                          className="hover:text-foreground hover:underline"
                        >
                          {item.user.email}
                        </a>
                      ) : (
                        contact
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center text-muted-foreground">
                      {item.createdAt.toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {item.checkedIn ? (
                        <span className="inline-block rounded bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                          체크인
                        </span>
                      ) : (
                        <span className="inline-block rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          신청
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
