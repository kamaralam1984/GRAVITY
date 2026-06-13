from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, secrets
from datetime import datetime

router = APIRouter()

class TicketCreate(BaseModel):
    category: str
    subject: str
    description: str
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    priority: str = "normal"

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None

@router.post("/")
def create_ticket(data: TicketCreate, db: Session = Depends(get_db)):
    ticket_num = "TKT-" + secrets.token_hex(3).upper()
    ticket = models.SupportTicket(ticket_number=ticket_num, **data.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"id": ticket.id, "ticket_number": ticket.ticket_number, "message": "Ticket created"}

@router.get("/")
def list_tickets(status: Optional[str] = None, priority: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    q = db.query(models.SupportTicket)
    if status:
        q = q.filter(models.SupportTicket.status == status)
    if priority:
        q = q.filter(models.SupportTicket.priority == priority)
    tickets = q.order_by(desc(models.SupportTicket.created_at)).limit(limit).all()
    total = db.query(func.count(models.SupportTicket.id)).scalar()
    open_count = db.query(func.count(models.SupportTicket.id)).filter(models.SupportTicket.status == "open").scalar()
    return {"total": total, "open": open_count, "tickets": [{"id": t.id, "ticket_number": t.ticket_number, "category": t.category, "priority": t.priority, "status": t.status, "subject": t.subject, "user_email": t.user_email, "created_at": t.created_at.isoformat() if t.created_at else None, "assigned_to": t.assigned_to} for t in tickets]}

@router.patch("/{ticket_id}")
def update_ticket(ticket_id: int, data: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if data.status:
        ticket.status = data.status
        if data.status == "resolved":
            ticket.resolved_at = datetime.utcnow()
    if data.priority:
        ticket.priority = data.priority
    if data.assigned_to:
        ticket.assigned_to = data.assigned_to
    if data.resolution:
        ticket.resolution = data.resolution
    db.commit()
    return {"message": "Ticket updated"}
