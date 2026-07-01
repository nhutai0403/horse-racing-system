import React from 'react';

const stats = [
  {
    icon: '♔',
    label: 'Giải Đua Trực Tiếp',
    value: '12',
    note: 'Tăng 4 so với hôm qua',
  },
  {
    icon: '▣',
    label: 'Tổng Giá Trị Giải Thưởng',
    value: '$4.2M',
    note: 'Đóng góp trên toàn cầu',
  },
  {
    icon: '□',
    label: 'Chiến Mã Đang Hoạt Động',
    value: '842',
    note: 'Thuộc hệ thống trang trại tinh hoa',
  },
];

export default function StatsSection() {
  return (
    <section className="stats-section" aria-label="Race statistics">
      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-icon" aria-hidden="true">{stat.icon}</span>
            <p className="stat-label">{stat.label}</p>
            <h3 className="stat-number">{stat.value}</h3>
            <p className="stat-trend">{stat.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
