
export type Problem = {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    starterCode: {
        python: string;
        java: string;
        cpp: string;
        javascript: string;
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

# Test code
if __name__ == "__main__":
    sol = Solution()
    print(sol.twoSum([2, 7, 11, 15], 9))
`,
            java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] result = sol.twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println(Arrays.toString(result));
    }
}
`,
            cpp: `#include <vector>
#include <iostream>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};

int main() {
    Solution sol;
    std::vector<int> nums = {2, 7, 11, 15};
    std::vector<int> result = sol.twoSum(nums, 9);
    for (int i : result) std::cout << i << " ";
    return 0;
}
`,
            javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};

// Test code
console.log(twoSum([2, 7, 11, 15], 9));
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
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> s = ["H","a","n","n","a","H"]
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

# Test code
if __name__ == "__main__":
    sol = Solution()
    s = ["h","e","l","l","o"]
    sol.reverseString(s)
    print(s)
`,
            java: `import java.util.*;

class Solution {
    public void reverseString(char[] s) {
        // Your code here
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        char[] s = {'h', 'e', 'l', 'l', 'o'};
        sol.reverseString(s);
        System.out.println(Arrays.toString(s));
    }
}
`,
            cpp: `#include <vector>
#include <iostream>

class Solution {
public:
    void reverseString(std::vector<char>& s) {
        // Your code here
    }
};

int main() {
    Solution sol;
    std::vector<char> s = {'h', 'e', 'l', 'l', 'o'};
    sol.reverseString(s);
    for (char c : s) std::cout << c;
    return 0;
}
`,
            javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    // Your code here
};

// Test code
let s = ["h","e","l","l","o"];
reverseString(s);
console.log(s);
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

# Test code
if __name__ == "__main__":
    sol = Solution()
    print(sol.isValid("()[]{}"))
`,
            java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isValid("()[]{}"));
    }
}
`,
            cpp: `#include <string>
#include <iostream>

class Solution {
public:
    bool isValid(std::string s) {
        // Your code here
        return false;
    }
};

int main() {
    Solution sol;
    std::cout << std::boolalpha << sol.isValid("()[]{}");
    return 0;
}
`,
            javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Your code here
};

// Test code
console.log(isValid("()[]{}"));
`
        },
        functionSignature: 'isValid(s: str) -> bool'
    }
];
