# SURY – Production-ready E-commerce Microservices

## 📝 Overview
A comprehensive e-commerce platform designed for a family fashion business, built with a robust **.NET 8 Microservices** architecture. This project focuses on high availability, scalability, and modern backend practices.

---

## 🏗 System Architecture
The system is built following the **Clean Architecture** principles and distributed into independent services:

* **API Gateway**: **Ocelot** serves as the single entry point, managing routing, centralized security, and CORS policies.
* **Microservices**: 
    * **Identity Service**: Handles authentication, user profiles, and address management.
    * **Catalog Service**: Manages products, categories, and inventory.
    * **Basket Service**: Manages shopping carts and temporary storage.
    * **Ordering Service**: Handles order lifecycles and historical data.
* **Communication**: **Event-driven** approach using **MassTransit** and **RabbitMQ** for reliable, asynchronous inter-service messaging.
* **Design Patterns**: 
    * **CQRS (Command Query Responsibility Segregation)** using **MediatR** for decoupled logic.
    * **Clean Architecture** for high maintainability.
    * **Repository Pattern & Unit of Work**.

---

## 🛠 Tech Stack
* **Backend**: .NET 8, Entity Framework Core.
* **Database**: MSSQL (Primary), Redis (Caching).
* **Messaging**: RabbitMQ, MassTransit.
* **Cloud Infrastructure**: 
    * **AWS S3**: Secure media storage.
    * **AWS CloudFront**: For global asset delivery and low-latency image caching.
* **DevOps**: Docker orchestration for environment consistency.

---

## 🚀 Key Backend Implementations
* **Secure Authentication**: Implemented **JWT with HttpOnly Cookies** to prevent XSS attacks; integrated automated **Email Verification** and password recovery flows.
* **Performance Optimization**: Layered caching strategy with **Redis** to reduce database load and improve response times.
* **System Resilience**: Robust handling of partial failures and distributed transactions to ensure data integrity across services.
* **Data Consistency**: Synchronized DTOs and shared data structures across services to ensure API contract consistency.