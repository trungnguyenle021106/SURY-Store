# SURY – Production-ready E-commerce Microservices

## 📝 Overview
A comprehensive e-commerce platform designed for a family fashion business, built with a robust **.NET 8 Microservices** architecture. This project focuses on high availability, scalability, and modern backend practices.

---

## 🏗 System Architecture
The system is built following the **Clean Architecture** principles and distributed into independent services:

* [cite_start]**API Gateway**: **Ocelot** serves as the single entry point, managing routing, centralized security, and CORS policies[cite: 34, 82].
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
* [cite_start]**Backend**: .NET 8, Entity Framework Core[cite: 10, 57].
* [cite_start]**Database**: MSSQL (Primary), Redis (Caching)[cite: 10, 57].
* **Messaging**: RabbitMQ, MassTransit.
* **Cloud Infrastructure**: 
    * [cite_start]**AWS S3**: Secure media storage[cite: 10, 57].
    * **AWS CloudFront**: CDN for global asset delivery and low-latency image caching.
* [cite_start]**DevOps**: Docker orchestration for environment consistency[cite: 10, 57].

---

## 🚀 Key Backend Implementations
* **Secure Authentication**: Implemented **JWT with HttpOnly Cookies** to prevent XSS attacks; integrated automated **Email Verification** and password recovery flows.
* **Performance Optimization**: Layered caching strategy with **Redis** to reduce database load and improve response times.
* **System Resilience**: Robust handling of partial failures and distributed transactions to ensure data integrity across services.
* [cite_start]**Data Consistency**: Synchronized DTOs and shared data structures across teams using Git Submodules[cite: 22, 70].

---

