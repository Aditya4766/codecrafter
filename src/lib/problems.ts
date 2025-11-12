export type Problem = {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    starterCode: {
        python: string;
        java: string;
        cpp: string;
    };
    functionSignature: string;
};

export const problems: Problem[] = [
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.</p>
<p>You can return the answer in any order.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</pre>

<h3 class="font-semibold mt-4 mb-2">Example 2:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> nums = [3,2,4], target = 6
<strong>Output:</strong> [1,2]</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>2 <= nums.length <= 10<sup>4</sup></code></li>
  <li><code>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></code></li>
  <li><code>-10<sup>9</sup> <= target <= 10<sup>9</sup></code></li>
  <li><strong>Only one valid answer exists.</strong></li>
</ul>
        `,
        starterCode: {
            python: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass
`,
            java: `import java.util.vector;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}
`,
            cpp: `#include <vector>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};
`
        },
        functionSignature: 'twoSum(nums: List[int], target: int) -> List[int]'
    },
    {
        id: 'reverse-string',
        title: 'Reverse String',
        difficulty: 'Easy',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.</p>
<p>You must do this by modifying the input array <strong>in-place</strong> with O(1) extra memory.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> s = ["h","e","l","l","o"]
<strong>Output:</strong> ["o","l","l","e","h"]</pre>

<h3 class="font-semibold mt-4 mb-2">Example 2:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> s = ["H","a","n","n","a","h"]
<strong>Output:</strong> ["h","a","n","n","a","H"]</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= s.length <= 10<sup>5</sup></code></li>
  <li><code>s[i]</code> is a printable ascii character.</li>
</ul>
        `,
        starterCode: {
            python: `from typing import List

class Solution:
    def reverseString(self, s: List[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        """
        # Your code here
        pass
`,
            java: `import java.util.vector;

class Solution {
    public void reverseString(char[] s) {
        // Your code here
    }
}
`,
            cpp: `#include <vector>

class Solution {
public:
    void reverseString(std::vector<char>& s) {
        // Your code here
    }
};
`
        },
        functionSignature: 'reverseString(s: List[str]) -> None'
    },
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Medium',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
<p>An input string is valid if:</p>
<ol class="list-decimal pl-5 space-y-1">
  <li>Open brackets must be closed by the same type of brackets.</li>
  <li>Open brackets must be closed in the correct order.</li>
  <li>Every close bracket has a corresponding open bracket of the same type.</li>
</ol>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> s = "()"
<strong>Output:</strong> true</pre>

<h3 class="font-semibold mt-4 mb-2">Example 2:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> s = "()[]{}"
<strong>Output:</strong> true</pre>

<h3 class="font-semibold mt-4 mb-2">Example 3:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> s = "(]"
<strong>Output:</strong> false</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= s.length <= 10<sup>4</sup></code></li>
  <li><code>s</code> consists of parentheses only <code>'()[]{}'</code>.</li>
</ul>
        `,
        starterCode: {
            python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Your code here
        pass
`,
            java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}
`,
            cpp: `#include <string>

class Solution {
public:
    bool isValid(std::string s) {
        // Your code here
        return false;
    }
};
`
        },
        functionSignature: 'isValid(s: str) -> bool'
    }
];
