import enum
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Role(str, enum.Enum):
    PRINCIPAL = "Principal"
    OFFICE_STAFF = "Office Staff"
    ACADEMIC_STAFF = "Academic Staff"
    TEACHER = "Teacher"
    SECURITY = "Security"
    PARENT = "Parent"
    STUDENT = "Student"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"
    LATE = "Late"
    EXCUSED = "Excused"


class GateAction(str, enum.Enum):
    ENTRY = "Entry"
    EXIT = "Exit"


class LeaveStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    DECLINED = "Declined"
    CANCELED = "Canceled"


class MembershipStatus(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"


def enum_column(enum_type: type[enum.Enum], name: str) -> Enum:
    return Enum(
        enum_type,
        name=name,
        native_enum=False,
        create_constraint=True,
        values_callable=lambda members: [member.value for member in members],
    )


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(enum_column(Role, "user_role"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    sessions: Mapped[list["UserSession"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    student: Mapped["Student | None"] = relationship(back_populates="user", uselist=False)
    staff: Mapped["Staff | None"] = relationship(back_populates="user", uselist=False)
    guardian: Mapped["Guardian | None"] = relationship(back_populates="user", uselist=False)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped[User] = relationship(back_populates="sessions")


class Student(TimestampMixin, Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_number: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(320), unique=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    emergency_contact: Mapped[str | None] = mapped_column(String(64))
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    user: Mapped[User | None] = relationship(back_populates="student")
    guardians: Mapped[list["StudentGuardian"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
    attendance_records: Mapped[list["AttendanceRecord"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
    gate_events: Mapped[list["GateEvent"]] = relationship(back_populates="student")
    leave_requests: Mapped[list["LeaveRequest"]] = relationship(back_populates="student")
    club_memberships: Mapped[list["ClubMembership"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )


class Guardian(TimestampMixin, Base):
    __tablename__ = "guardians"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str | None] = mapped_column(String(320), unique=True)
    phone: Mapped[str | None] = mapped_column(String(64))
    national_id: Mapped[str | None] = mapped_column(String(32))
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True
    )

    user: Mapped[User | None] = relationship(back_populates="guardian")
    students: Mapped[list["StudentGuardian"]] = relationship(
        back_populates="guardian", cascade="all, delete-orphan"
    )


class StudentGuardian(Base):
    __tablename__ = "student_guardians"
    __table_args__ = (
        UniqueConstraint("student_id", "guardian_id", name="uq_student_guardian"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    guardian_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("guardians.id", ondelete="CASCADE"), nullable=False
    )
    relationship_label: Mapped[str | None] = mapped_column(String(50))
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    student: Mapped[Student] = relationship(back_populates="guardians")
    guardian: Mapped[Guardian] = relationship(back_populates="students")


class Staff(TimestampMixin, Base):
    __tablename__ = "staff"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_number: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    job_title: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    phone: Mapped[str | None] = mapped_column(String(64))
    national_id: Mapped[str | None] = mapped_column(String(32))
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    user: Mapped[User | None] = relationship(back_populates="staff")
    classes: Mapped[list["SchoolClass"]] = relationship(back_populates="homeroom_teacher")
    marked_attendance: Mapped[list["AttendanceRecord"]] = relationship(back_populates="marked_by")
    gate_events: Mapped[list["GateEvent"]] = relationship(
        foreign_keys="GateEvent.staff_id", back_populates="staff"
    )
    recorded_gate_events: Mapped[list["GateEvent"]] = relationship(
        foreign_keys="GateEvent.recorded_by_staff_id", back_populates="recorded_by"
    )
    reviewed_leave_requests: Mapped[list["LeaveRequest"]] = relationship(back_populates="reviewed_by")


class AcademicYear(TimestampMixin, Base):
    __tablename__ = "academic_years"
    __table_args__ = (
        CheckConstraint("starts_on < ends_on", name="ck_academic_year_dates"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    starts_on: Mapped[date] = mapped_column(Date, nullable=False)
    ends_on: Mapped[date] = mapped_column(Date, nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    terms: Mapped[list["Term"]] = relationship(back_populates="academic_year", cascade="all, delete-orphan")
    classes: Mapped[list["SchoolClass"]] = relationship(back_populates="academic_year")


class Term(TimestampMixin, Base):
    __tablename__ = "terms"
    __table_args__ = (
        CheckConstraint("starts_on < ends_on", name="ck_term_dates"),
        UniqueConstraint("academic_year_id", "name", name="uq_term_year_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    starts_on: Mapped[date] = mapped_column(Date, nullable=False)
    ends_on: Mapped[date] = mapped_column(Date, nullable=False)

    academic_year: Mapped[AcademicYear] = relationship(back_populates="terms")


class SchoolClass(TimestampMixin, Base):
    __tablename__ = "school_classes"
    __table_args__ = (
        UniqueConstraint("academic_year_id", "name", name="uq_school_class_year_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(20), nullable=False)
    grade_level: Mapped[int] = mapped_column(Integer, nullable=False)
    section: Mapped[str] = mapped_column(String(10), nullable=False)
    room: Mapped[str | None] = mapped_column(String(30))
    homeroom_teacher_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL")
    )

    academic_year: Mapped[AcademicYear] = relationship(back_populates="classes")
    homeroom_teacher: Mapped[Staff | None] = relationship(back_populates="classes")
    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="school_class", cascade="all, delete-orphan"
    )
    attendance_records: Mapped[list["AttendanceRecord"]] = relationship(back_populates="school_class")


class Enrollment(TimestampMixin, Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("student_id", "academic_year_id", name="uq_enrollment_student_year"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    school_class_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("school_classes.id", ondelete="RESTRICT"), nullable=False
    )
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False
    )
    enrolled_on: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)

    student: Mapped[Student] = relationship(back_populates="enrollments")
    school_class: Mapped[SchoolClass] = relationship(back_populates="enrollments")


class AttendanceRecord(TimestampMixin, Base):
    __tablename__ = "attendance_records"
    __table_args__ = (
        UniqueConstraint("student_id", "attendance_date", name="uq_attendance_student_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    school_class_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("school_classes.id", ondelete="RESTRICT"), nullable=False
    )
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    status: Mapped[AttendanceStatus] = mapped_column(
        enum_column(AttendanceStatus, "attendance_status"), nullable=False
    )
    check_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    note: Mapped[str | None] = mapped_column(Text)
    marked_by_staff_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL")
    )

    student: Mapped[Student] = relationship(back_populates="attendance_records")
    school_class: Mapped[SchoolClass] = relationship(back_populates="attendance_records")
    marked_by: Mapped[Staff | None] = relationship(back_populates="marked_attendance")


class GateEvent(TimestampMixin, Base):
    __tablename__ = "gate_events"
    __table_args__ = (
        CheckConstraint(
            "(student_id IS NOT NULL AND staff_id IS NULL) OR "
            "(student_id IS NULL AND staff_id IS NOT NULL)",
            name="ck_gate_event_one_person",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id", ondelete="SET NULL")
    )
    staff_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL")
    )
    action: Mapped[GateAction] = mapped_column(enum_column(GateAction, "gate_action"), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    recorded_by_staff_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL")
    )

    student: Mapped[Student | None] = relationship(back_populates="gate_events")
    staff: Mapped[Staff | None] = relationship(foreign_keys=[staff_id], back_populates="gate_events")
    recorded_by: Mapped[Staff | None] = relationship(
        foreign_keys=[recorded_by_staff_id], back_populates="recorded_gate_events"
    )


class LeaveRequest(TimestampMixin, Base):
    __tablename__ = "leave_requests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id", ondelete="RESTRICT"), nullable=False
    )
    requested_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    reviewed_by_staff_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL")
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    departure_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[LeaveStatus] = mapped_column(
        enum_column(LeaveStatus, "leave_status"),
        nullable=False,
        default=LeaveStatus.PENDING,
        server_default=LeaveStatus.PENDING.value,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    student: Mapped[Student] = relationship(back_populates="leave_requests")
    requested_by: Mapped["User | None"] = relationship(foreign_keys=[requested_by_user_id])
    reviewed_by: Mapped[Staff | None] = relationship(back_populates="reviewed_leave_requests")


class Club(TimestampMixin, Base):
    __tablename__ = "clubs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    meeting_schedule: Mapped[str | None] = mapped_column(String(200))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    memberships: Mapped[list["ClubMembership"]] = relationship(
        back_populates="club", cascade="all, delete-orphan"
    )


class ClubMembership(TimestampMixin, Base):
    __tablename__ = "club_memberships"
    __table_args__ = (
        UniqueConstraint("student_id", "club_id", name="uq_club_membership_student_club"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    club_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False
    )
    joined_on: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    status: Mapped[MembershipStatus] = mapped_column(
        enum_column(MembershipStatus, "membership_status"),
        nullable=False,
        default=MembershipStatus.ACTIVE,
        server_default=MembershipStatus.ACTIVE.value,
    )

    student: Mapped[Student] = relationship(back_populates="club_memberships")
    club: Mapped[Club] = relationship(back_populates="memberships")


class Subject(TimestampMixin, Base):
    __tablename__ = "subjects"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text)

    assessments: Mapped[list["Assessment"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan"
    )


class Assessment(TimestampMixin, Base):
    __tablename__ = "assessments"
    __table_args__ = (
        CheckConstraint("maximum_score > 0", name="ck_assessment_maximum_score_positive"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False
    )
    school_class_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("school_classes.id", ondelete="CASCADE"), nullable=False
    )
    term_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("terms.id", ondelete="RESTRICT"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    due_on: Mapped[date | None] = mapped_column(Date)
    maximum_score: Mapped[Decimal] = mapped_column(Numeric(7, 2), nullable=False)
    created_by_staff_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("staff.id", ondelete="SET NULL")
    )

    subject: Mapped[Subject] = relationship(back_populates="assessments")
    results: Mapped[list["AssessmentResult"]] = relationship(
        back_populates="assessment", cascade="all, delete-orphan"
    )


class AssessmentResult(TimestampMixin, Base):
    __tablename__ = "assessment_results"
    __table_args__ = (
        UniqueConstraint("assessment_id", "student_id", name="uq_assessment_result_student"),
        CheckConstraint("score >= 0", name="ck_assessment_result_score_nonnegative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    score: Mapped[Decimal] = mapped_column(Numeric(7, 2), nullable=False)
    feedback: Mapped[str | None] = mapped_column(Text)

    assessment: Mapped[Assessment] = relationship(back_populates="results")
    student: Mapped[Student] = relationship()
