import matplotlib.pyplot as plt
import numpy as np

N = np.linspace(2, 64, num=500)

constant = 2.1 * np.ones_like(N)
logarithmic = np.log2(N)
linear = N
linearithmic = N * np.log2(N)
quadratic = N**2
exponential = 2.0**N

colors = {
    "constant": "C0",
    "logarithmic": "C1",
    "linear": "C2",
    "linearithmic": "C3",
    "quadratic": "C4",
    "exponential": "C5",
}

fig, ax = plt.subplots(figsize=(5, 5))
ax.plot(N, exponential, label=r"$O(2^N)$", color=colors["exponential"])
ax.plot(N, quadratic, label=r"$O(N^2)$", color=colors["quadratic"])
ax.plot(N, linearithmic, label=r"$O(N \log N)$", color=colors["linearithmic"])
ax.plot(N, linear, label=r"$O(N)$", color=colors["linear"])
ax.plot(N, logarithmic, label=r"$O(\log N)$", color=colors["logarithmic"])
ax.plot(N, constant, label=r"$O(1)$", color=colors["constant"])
ax.set_xscale('log', base=2)
ax.set_yscale('log', base=2)
ax.set_aspect('equal')
ax.set_xlabel("N")
ax.set_ylabel("Operations")
ax.set_xlim(2, 32)
ax.set_ylim(2, 32)
ax.legend()
ax.grid(True, which="both", alpha=0.3)
fig.tight_layout()
fig.savefig("../assets/downloads/plotComplexitiesTheoryEqualAxis.svg")
plt.close(fig)

fig, ax = plt.subplots(figsize=(5, 5))
ax.plot(N, exponential, label=r"$O(2^N)$", color=colors["exponential"])
ax.plot(N, quadratic, label=r"$O(N^2)$", color=colors["quadratic"])
ax.plot(N, linearithmic, label=r"$O(N \log N)$", color=colors["linearithmic"])
ax.plot(N, linear, label=r"$O(N)$", color=colors["linear"])
ax.plot(N, logarithmic, label=r"$O(\log N)$", color=colors["logarithmic"])
ax.plot(N, constant, label=r"$O(1)$", color=colors["constant"])
ax.set_xscale('log', base=2)
ax.set_yscale('log', base=2)
ax.set_xlabel("N")
ax.set_ylabel("Operations")
ax.legend()
ax.grid(True, which="both", alpha=0.3)
fig.tight_layout()
fig.savefig("../assets/downloads/plotComplexitiesTheoryNotEqualAxis.svg")
plt.close(fig)

fig, ax = plt.subplots(figsize=(5, 5))
ax.plot(N, quadratic, label=r"$O(N^2)$", color=colors["quadratic"])
ax.plot(N, linearithmic, label=r"$O(N \log N)$", color=colors["linearithmic"])
ax.plot(N, linear, label=r"$O(N)$", color=colors["linear"])
ax.plot(N, logarithmic, label=r"$O(\log N)$", color=colors["logarithmic"])
ax.plot(N, constant, label=r"$O(1)$", color=colors["constant"])
ax.set_xscale('log', base=2)
ax.set_yscale('log', base=2)
ax.set_xlabel("N")
ax.set_ylabel("Operations")
ax.legend()
ax.grid(True, which="both", alpha=0.3)
fig.tight_layout()
fig.savefig("../assets/downloads/plotComplexitiesTheoryFasterThanExponential.svg")
plt.close(fig)